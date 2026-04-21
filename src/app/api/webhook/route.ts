import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import OpenAi from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

import {
    CallEndedEvent,
    CallRecordingReadyEvent,
    CallSessionParticipantLeftEvent,
    CallSessionStartedEvent,
    CallTranscriptionReadyEvent,
    MessageNewEvent,
} from "@stream-io/node-sdk";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { generatedAvatarUri } from "@/lib/avatar";
import { streamChat } from "@/lib/stream-chat";
import { streamVideo } from "@/lib/stream-video";
import JSONL from "jsonl-parse-stringify";

const openaiClient = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY!});

function verifySignatureWithSDK(body: string, signature: string):boolean{
    return streamVideo.verifyWebhook(body, signature);

};

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-signature");

    if(!signature){
        return NextResponse.json(
            { error: "Missing signature" }, 
            { status: 400 }
        );
    }

    const body = await req.text();

    if(!verifySignatureWithSDK(body, signature)){
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
        );
    }

   let payload: unknown;
   try{
    payload = JSON.parse(body) as Record<string, unknown>;
   }catch{
       return NextResponse.json(
           { error: "Invalid JSON" },
           { status: 400 }
       );
   }

   const eventType = (payload as Record<string, unknown>)?.type;

   if(eventType === "call.session_started"){
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId;

    if(!meetingId){
       return NextResponse.json(
           { error: "Missing meeting ID" },
           { status: 400 }
       );
    }

    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and (
        eq(meetings.id, meetingId),
        not(eq(meetings.status, "completed")),
        not(eq(meetings.status, "active")),
        not(eq(meetings.status, "cancelled")),
        not(eq(meetings.status, "processing")),
      ));

    if(!existingMeeting){
        return NextResponse.json(
            { error: "Meeting not found or already started/completed/cancelled" },
            { status: 404 }
        );
    }

    await db
      .update(meetings)
      .set({ 
        status: "active", 
        startedAt: new Date() 
        })
      .where(eq(meetings.id, existingMeeting.id));

      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, existingMeeting.agentId));

        if(!existingAgent){
            return NextResponse.json(
                { error: "Agent not found" },
                { status: 404 }
            );
        }

        const call = streamVideo.video.call("default",  meetingId);
        const realtimeClient = await streamVideo.video.connectOpenAi({
            call,
            openAiApiKey: process.env.OPENAI_API_KEY!,
            agentUserId: existingAgent.id,
        });

        realtimeClient.updateSession({
            instructions: existingAgent.instructions,
    


        });
        console.log('connectOpenAi OK', { meetingId, agentId: existingAgent.id });

   }else if(eventType === "call.session_participant_left"){
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(":")[1];

    if(!meetingId){
       return NextResponse.json(
           { error: "Missing meeting ID" },
           { status: 400 }
       );
    }

    const call = streamVideo.video.call("default",  meetingId);
    await call.end();

   }else if(eventType === "call.session_ended"){
    const event = payload as CallEndedEvent;
    const meetingId = event.call.custom?.meetingId;

    if(!meetingId){
       return NextResponse.json(
           { error: "Missing meeting ID" },
           { status: 400 }
       );
    }

    await db
      .update(meetings)
      .set({ 
        status: "processing", 
        endedAt: new Date()
      })
      .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));

   }else if(eventType === "call.transcription_ready"){
    const event = payload as CallTranscriptionReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    if(!meetingId){
       return NextResponse.json(
           { error: "Missing meeting ID" },
           { status: 400 }
       );
    }

    const [updatedMeeting] = await db
    .update(meetings)
    .set({
        transcriptURL: event.call_transcription.url,
    })
    .where(eq(meetings.id, meetingId))
    .returning();

    if(!updatedMeeting){
        return NextResponse.json(
            { error: "Failed to update meeting" },
            { status: 400 }
        );
    }

    try {
        console.log("Generating summary inline for meeting:", meetingId);
        const res = await fetch(updatedMeeting.transcriptURL);
        const text = await res.text();
        const transcript = JSONL.parse<{speaker_id: string, text: string}>(text);
        const cleanText = transcript.map(i => `${i.speaker_id || 'Unknown'}: ${i.text}`).join("\n");
        
        const completion = await openaiClient.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an expert summarizer. Write a concise, readable summary using markdown with an Overview and Notes section." },
                { role: "user", content: "Summarize this transcript:\n\n" + cleanText }
            ]
        });
        
        const summary = completion.choices[0]?.message?.content;
        
        await db.update(meetings)
        .set({ summary: summary, status: "completed" })
        .where(eq(meetings.id, updatedMeeting.id));
        console.log("Summary generated successfully!");

    } catch (err) {
        console.error("Failed to generate summary inline:", err);
    }

   }else if(eventType === "call.recording_ready"){
    const event = payload as CallRecordingReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    await db
    .update(meetings)
    .set({
        recordingURL: event.call_recording.url,
    })
    .where(eq(meetings.id, meetingId));
   }else if(eventType === "message.new"){
    const event = payload as MessageNewEvent;

    const userId = event.user?.id;
    const channelId = event.channel_id;
    const text = event.message?.text;

    if(!userId || !channelId || !text){
        return NextResponse.json(
            { error: "Missing user ID, channel ID, or message text" },
            { status: 400 }
        );
    }

    const [existingMeeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));

    if(!existingMeeting){
        return NextResponse.json(
            { error: "Meeting not found or not completed" },
            { status: 404 }
        );
    }

    const [existingAgent] = await db
    .select()
    .from(agents)
    .where(eq(agents.id, existingMeeting.agentId));

    if(!existingAgent){
        return NextResponse.json(
            { error: "Agent not found" },
            { status: 404 }
        );
    }

    if(userId !== existingAgent.id){
        const instructions = `
      You are an AI assistant helping the user revisit a recently completed meeting.
      Below is a summary of the meeting, generated from the transcript:
      
      ${existingMeeting.summary}
      
      The following are your original instructions from the live meeting assistant. Please continue to follow these behavioral guidelines as you assist the user:
      
      ${existingAgent.instructions}
      
      The user may ask questions about the meeting, request clarifications, or ask for follow-up actions.
      Always base your responses on the meeting summary above.
      
      You also have access to the recent conversation history between you and the user. Use the context of previous messages to provide relevant, coherent, and helpful responses. If the user's question refers to something discussed earlier, make sure to take that into account and maintain continuity in the conversation.
      
      If the summary does not contain enough information to answer a question, politely let the user know.
      
      Be concise, helpful, and focus on providing accurate information from the meeting and the ongoing conversation.
      `;

      const channel = streamChat.channel("messaging", channelId);
      await channel.watch();

      const previousMessages =  channel.state.messages
      .slice(-5)
      .filter((msg) => msg.text && msg.text?.trim() !== "")
      .map<ChatCompletionMessageParam>((message) => ({
        role: message.user?.id === existingAgent.id ? "assistant" : "user",
        content: message.text || "",
      }));

      const GPTResponse = await openaiClient.chat.completions.create({
        messages:[
            { role: "system", content: instructions },
            ...previousMessages,
            { role: "user", content: text },
        ],
        model: "gpt-4o",
      });

      const GPTResponseText = GPTResponse.choices[0]?.message?.content;

      if(!GPTResponseText){
        return NextResponse.json(
            { error: "No response from OpenAI" },
            { status: 400 }
        );
      }

      const avatarUrl = generatedAvatarUri({
        seed: existingAgent.name,
        variant: "botttsNeutral"
      });

      streamChat.upsertUser({
        id: existingAgent.id,
        name: existingAgent.name,
        image: avatarUrl,
      });

      channel.sendMessage({
        text: GPTResponseText,
        user: {
            id: existingAgent.id,
          name: existingAgent.name,
          image: avatarUrl,
        },
      });
    }
   } 

   return NextResponse.json({ status: "ok" });


}
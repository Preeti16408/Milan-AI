"use client"

import { authClient } from "@/lib/auth-client"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, MessageSquare, Users, Video, Zap, Clock, Bot,CreditCardIcon } from "lucide-react";
import Link from "next/link";

export const HomeView = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            AI-Powered Meetings
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-900 to-blue-800 bg-clip-text text-transparent">
            Milan.AI
          </h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
            Transform your meetings with intelligent AI agents that assist, transcribe, and analyze your conversations in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/meetings">
                <CalendarPlus className="w-5 h-5 mr-2" />
                Start Meeting
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/agents">
                <Bot className="w-5 h-5 mr-2" />
                Create Agent
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>AI-Powered Meetings</CardTitle>
              <CardDescription>
                Host video meetings with intelligent AI agents that participate and assist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time AI participation</li>
                <li>• RealTime AI Agent in meeting</li>
                <li>• Smart suggestions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
                <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Smart Transcriptions</CardTitle>
              <CardDescription>
                Automatic transcription and intelligent meeting summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Live transcription</li>
                <li>• AI-generated summaries</li>
                <li>• Searchable content</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
                <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Custom AI Agents</CardTitle>
              <CardDescription>
                Create personalized AI agents with specific instructions and roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Customizable behavior</li>
                <li>• Role-specific agents</li>
                <li>• Persistent memory</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with your AI-powered meetings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex-col gap-2"
                onClick={() => authClient.customer.portal()}
              >
                <CreditCardIcon className="w-6 h-6" />
                <span>Manage Billing</span>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                <Link href="/agents/new">
                  <Bot className="w-6 h-6" />
                  <span>Create Agent</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                <Link href="/meetings">
                  <Users className="w-6 h-6" />
                  <span>View Meetings</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                <Link href="/agents">
                  <Users className="w-6 h-6" />
                  <span>Manage Agents</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
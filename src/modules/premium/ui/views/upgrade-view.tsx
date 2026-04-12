"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { authClient } from "@/lib/auth-client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { PricingCard } from "../components/pricing-card";

export const UpgradeView = () => {
  const trpc = useTRPC();

  const { data: products } = useSuspenseQuery(
    trpc.premium.getProducts.queryOptions()
  );

  const { data: currentSubscription } = useSuspenseQuery(
    trpc.premium.getCurrentSubscription.queryOptions()
  );

  return (
    <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-10">
      <div className="mt-4 flex-1 flex flex-col gap-y-10 items-center">
        <h5 className="font-medium text-2xl md:text-3xl">
          You are on the{" "}
          <span className="font-semibold text-primary">
            {currentSubscription?.name ?? "Free"}
          </span>{" "}
          plan
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
            {products?.map((product, index) => {
                const isCurrentProduct = currentSubscription?.id === product.id;
                const isPremium = !!currentSubscription;

                let buttonText = "Upgrade";
                let onClick = () => authClient.checkout({ products: [product.id]});

                if (isCurrentProduct) {
                    buttonText = "Manage";
                    onClick = () => authClient.customer.portal();
                } else if (isPremium) {
                    buttonText = "Change Plan";
                    onClick = () => authClient.customer.portal();
                }

                return (
                    <PricingCard
                    className="m-2 p-10"
                    key={product.id}
                    buttonText={buttonText}
                    onClick={onClick}
                    variant ={
                        index === 1 ? "highlighted" : "default"
                    }
                    title={product.name}
                    price ={
                        product.prices[0]?.amountType === "fixed"
                        ? product.prices[0].priceAmount / 100
                        : 0
                    }
                    description = { 
                        index === 0 ? "For teams getting started" :
                        index === 1 ? "For Teams that need to scale." :
                        "For teams with special requests."
                    }
                    priceSuffix={product.prices[0] ? `/${product.prices[0].recurringInterval}` : "/month"}
                    features={
                        index === 0 ? ["Unlimited meetings", "Unlimited agents"] :
                        index === 1 ? ["Unlimited meetings", "Unlimited agents", "2 Months free"] :
                        ["2 Months free", "Unlimited meetings", "Unlimited agents", "Dedicated discord invite"]
                    }
                    badge ={ index === 1 ? "Best Value" : null }

                    />
                )
            })}

        </div>
      </div>
    </div>
  );
};

export const UpgradeViewLoading = () => {
  return (
    <LoadingState
      title="Loading"
      description="Please wait while we load the upgrade options..."
    />
  );
};

export const UpgradeViewError = () => {
  return (
    <ErrorState
      title="Error Loading"
      description="There was an error loading the upgrade options. Please try again later."
    />
  );
};

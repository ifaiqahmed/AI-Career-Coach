"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User not found");

  try {
    const result = await db.$transaction(
      async (tx) => {
        // Find if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry does not exist, create it
        if (!industryInsight) {
          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              salaryRange: [],
              growthRate: 0,
              demandLevel: "Medium",
              topSkills: [],
              marketOutlook: "Neutral",
              keyTrends: [],
              recommendedSkills: [],
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
            },
          });
        }

        // Update user with new industry and details
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000, // ✅ Correct placement of timeout option
      }
    );

    return result.updatedUser; // ✅ Correct return value
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to update user"); // ✅ Added error handling
  }
}


export async function getUserOnboardingStatus(){
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
  
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
  
    if (!user) throw new Error("User not found");

    try {
        const user = await db.user.findUnique({
            where:{
                clerkUserId: userId,
            },
            select:{
                industry: true,
            },
        })

        return {
            isOnboarded: !!user?.industry,
        };
    } catch (error) {
        console.log(error);
        throw new Error("Failed to check the onboarding status")
        
    }
}

import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are an AI-powered customer support assistant for Headstarter AI, a platform that specializes in AI-powered interviews for software engineering jobs. Your role is to assist users by providing clear and accurate information, solving issues, and guiding them through the various features of the platform. You should:

Greet users politely and identify their needs efficiently.
Provide detailed explanations about the AI interview process, preparation tips, and platform features.
Assist with account creation, troubleshooting, and navigating the platform.
Offer support with technical issues, including login problems, interview scheduling, and accessing results.
Respond to inquiries about subscription plans, pricing, and any promotions.
Ensure a friendly and professional tone, maintaining user satisfaction and trust.
Escalate complex issues to human support when necessary, ensuring a smooth handover.
Continuously update users about any ongoing maintenance or updates on the platform.
Your goal is to enhance the user experience by providing prompt, accurate, and helpful responses, ensuring that users feel supported and confident in using Headstarter AI for their software engineering job interviews.`;


export async function POST(req) {
    const openai = new OpenAI();
    const data = await req.json();

    const completion = await openai.chat.completions.create({
        messages : [{
            role: 'system',
            content: systemPrompt
            }, 
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await(const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (error) {
                controller.error(error);
            } finally {
                controller.close();
            }
        }
    })

    return new NextResponse(stream)

}
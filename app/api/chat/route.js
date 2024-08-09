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

    const data = await req.json();
    const openai = new OpenAI(
        {
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
    }
    );

    const completion = await openai.chat.completions.create({
        messages : [{
            role: 'system',
            content: systemPrompt
            }, 
            ...data,
        ],
        // model: "meta-llama/llama-3.1-8b-instruct:free",
        model: "qwen/qwen-2-7b-instruct:free",
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
    return new NextResponse(stream);
}


// export async function POST(req) {

//     const data = await req.json();

//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//         method: "POST",
//         headers: {
//             "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             "model": 'meta-llama/llama-3.1-8b-instruct:free',
//             "messages": [
//                 {
//                     "role": 'system',
//                     "content": systemPrompt
//                 },
//                 ...data,
//             ],
//         })
//     });

//     if (!response.ok) {
//         const errorDetails = await response.text();
//         console.error('Error Details:', errorDetails);
//         throw new Error(`Failed to fetch from OpenRouter API: ${response.status} ${response.statusText}`);
//     }
//     const responseData = await response.json();
//     const content = responseData.choices[0].message.content;
//     console.log("Extracted Content:", content);

//     return new NextResponse(content, {
//         headers: { 'Content-Type': 'text/plain' }
//     });

// }
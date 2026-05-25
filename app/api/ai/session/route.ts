import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai, getSystemPrompt } from '@/lib/openai';
import type { AddictionType } from '@/types';

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { addictionType, location, trigger, nearby } = (await req.json()) as {
    addictionType: AddictionType;
    location: string;
    trigger: string;
    nearby: string;
  };

  if (!addictionType || !location || !trigger || !nearby) {
    return new NextResponse('Missing fields', { status: 400 });
  }

  // Create the session record first
  const { data: session, error: sessionError } = await supabase
    .from('craving_sessions')
    .insert({
      user_id: user.id,
      addiction_type: addictionType,
      location_answer: location,
      trigger_answer: trigger,
      nearby_answer: nearby,
    })
    .select('id')
    .single();

  if (sessionError || !session) {
    console.error('[ai/session] DB insert error:', sessionError);
    return new NextResponse('Failed to create session', { status: 500 });
  }

  const systemPrompt = getSystemPrompt(addictionType);
  const userMessage = `Location: ${location}\nTrigger: ${trigger}\nWhat is within reach: ${nearby}`;

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: true,
      max_tokens: 600,
      temperature: 0.75,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-store',
        'X-Session-Id': session.id,
      },
    });
  } catch (err) {
    console.error('[ai/session] OpenAI error:', err);
    return new NextResponse('AI service unavailable', { status: 503 });
  }
}

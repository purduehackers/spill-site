import React from 'react';

interface TicketCustomizationProps {
  name: string;
}

export default function TicketCustomization({ name }: TicketCustomizationProps) {
  return (
    <div className="w-full h-3/4 flex gap-4">
        <div className="w-1/2 h-full flex flex-col gap-4 bg-coffee text-paper border-2 border-coffee rounded-lg p-4">
            <div>
                    ಃ create your ticket ಀ
            </div>
            <div>
                <input className=""
                    type="text"
                    placeholder="name"
                />
            </div>

            <h1>Hello, {name}!</h1>
            <p>Welcome to our Astro + React site!</p>
        </div>

        <div className="w-1/2 h-full flex flex-col gap-4 justify-between border-2 border-coffee rounded-lg p-4">
            <div>
                hello friends
            </div>

            <div className="flex flex-col gap-2 p-6">
                <div className="flex flex-row gap-2">
                    <div className="tea-tag w-24 h-24">
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <span>tea</span>
                            <span>tag!</span>
                        </div>
                    </div>
                    <div className="tea-tag w-24 h-24 bg-sage">
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <span>tea</span>
                            <span>tag!</span>
                        </div>
                    </div>
                    <div className="tea-tag w-24 h-24 bg-coffee-light">
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <span>tea</span>
                            <span>tag!</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2 p-6">
                <div className="flex flex-row gap-2">
                    <div className="tea-tag-oct w-24 h-24 bg-pine">
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <span>tea</span>
                            <span>tag!</span>
                        </div>
                    </div>
                    <div className="tea-tag-oct w-24 h-24 bg-red-clay">
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <span>tea</span>
                            <span>tag!</span>
                        </div>
                    </div>
                    <div className="tea-tag-oct w-24 h-24 bg-coffee">
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <span>tea</span>
                            <span>tag!</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
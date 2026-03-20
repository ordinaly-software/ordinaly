"use client";
import React from "react";
import { PinContainer } from "@/components/ui/3d-pin";

export function Card3D({ title, description, image }: { title: string; description: string; image: string }) {
    return (
        <PinContainer title={title} href="#formulario">
            <div className="flex flex-col p-4 text-slate-100/80 w-[20rem] h-[20rem]">
                <h3 className="font-bold text-lg text-white">{title}</h3>
                <p className="text-slate-400 mt-2">{description}</p>
                <div className="flex flex-1 w-full rounded-lg mt-4 overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </PinContainer>
    );
}

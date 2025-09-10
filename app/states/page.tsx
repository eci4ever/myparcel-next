import React from "react";
import Counter, { Name, NameDisplay } from "./ui/counter";
import Effect from "./ui/effect";
import Clock from "./ui/effect";

export default function page() {
  return (
    <div className="flex items-center justify-center h-screen flex-col gap-4">
      <h1>Hello</h1>
      <Clock />
      {/* <Effect /> */}
      {/* <NameDisplay /> */}
      {/* <Counter /> */}
      {/* <Name /> */}
    </div>
  );
}

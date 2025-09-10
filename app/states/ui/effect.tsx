'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

// export default function Effect() {
//     const [count, setCount] = useState(0)

//     useEffect(() => {
//         console.log(`Count changed: ${count}`)
//     }, [count])
//     return (
//         <div>
//             <h1>Effect Counter: {count}</h1>
//             <Button onClick={() => setCount(count + 1)}>Increment</Button>
//             <Button onClick={() => setCount(count - 1)}>Decrement</Button>
//         </div>
//     )
// }

export default function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Update setiap 1 saat
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        // Cleanup bila komponen hilang
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-xl">Sekarang pukul:</h1>
            <p className="font-mono text-2xl">{time.toLocaleTimeString()}</p>
        </div>
    );
}
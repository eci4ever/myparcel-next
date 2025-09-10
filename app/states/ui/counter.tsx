'use client'

import React, { use } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Counter() {
    const [count, setCount] = useState(0)
    return (
        <div className="flex flex-col items-center gap-4">
            <h1>Counter: {count}</h1>
            <Button onClick={() => setCount(count + 1)}>Increment</Button>
            <Button onClick={() => setCount(count - 1)}>Decrement</Button>
        </div>
    )
}

export function Name() {
    const [name, setName] = useState('Guest')

    return (
        <div className="flex flex-col items-center gap-4">
            <h1>Name: {name}</h1>
            <Button onClick={() => setName('Alice')}>Set Name to Alice</Button>
            <Button onClick={() => setName('Bob')}>Set Name to Bob</Button>
            <Button onClick={() => setName('Guest')}>Reset Name</Button>
        </div>
    )
}

export function NameDisplay() {
    const [name, setName] = useState('')
    return <div>
        <p>Name: {name || 'Guest'}</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="border p-2 rounded ml-2" />
    </div>
}
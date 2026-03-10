import { useState, useEffect, useRef } from "react";
import { WS_HOST, WS_PORT, WS_KEY } from "@/app/config/app.config";
import { SectionHeader } from "../ui/SectionHeader";
import { KVRow } from "../ui/KVRow";
import { Pill } from "../ui/Pill";

type LogEntry = {
    ts: number;
    msg: string;
    type: "in" | "out" | "sys";
};

export function WsTab() {
    const [connected, setConnected] = useState(false);
    const [log, setLog] = useState<LogEntry[]>([]);
    const [input, setInput] = useState("");
    const wsRef = useRef<WebSocket | null>(null);
    const endRef = useRef<HTMLDivElement>(null);

    const push = (msg: string, type: "in" | "out" | "sys") =>
        setLog(l => [...l.slice(-99), { ts: Date.now(), msg, type }]);

    const connect = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        const url = `ws://${WS_HOST}:${WS_PORT}/app/${WS_KEY}`;
        push(`Connecting to ${url}…`, "sys");

        const ws = new WebSocket(url);
        ws.onopen = () => {
            setConnected(true);
            push("Connected ✓", "sys");
        };
        ws.onclose = () => {
            setConnected(false);
            push("Disconnected", "sys");
        };
        ws.onerror = () => push("Connection error", "sys");
        ws.onmessage = (e) => push(e.data, "in");

        wsRef.current = ws;
    };

    const disconnect = () => {
        wsRef.current?.close();
        wsRef.current = null;
    };

    const send = () => {
        if (!wsRef.current || !input.trim()) return;
        wsRef.current.send(input);
        push(input, "out");
        setInput("");
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [log]);

    useEffect(() => {
        return () => wsRef.current?.close();
    }, []);

    const logColor = {
        in: "text-emerald-400",
        out: "text-sky-400",
        sys: "text-zinc-500"
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <SectionHeader
                title="WebSocket Tester"
                action={
                    <div className="flex items-center gap-2">
                        <Pill color={connected ? "emerald" : "zinc"}>
                            {connected ? "LIVE" : "IDLE"}
                        </Pill>
                        <button
                            onClick={connected ? disconnect : connect}
                            className={`text-[14px] px-2 py-0.5 rounded font-bold transition-colors ${
                                connected ? "text-red-400 hover:text-red-300" : "text-emerald-400 hover:text-emerald-300"
                            }`}
                        >
                            {connected ? "Disconnect" : "Connect"}
                        </button>
                    </div>
                }
            />

            <div className="px-3 py-2 border-b border-zinc-800 space-y-1.5">
                <KVRow label="Host" value={WS_HOST} />
                <KVRow label="Port" value={String(WS_PORT)} />
                <KVRow label="Key" value={WS_KEY ? `${WS_KEY.slice(0, 8)}…` : "—"} />
            </div>

            <div className="flex-1 overflow-y-auto bg-zinc-950 font-mono text-[14px] p-2">
                {log.length === 0 ? (
                    <span className="text-zinc-700">Connect to see messages…</span>
                ) : (
                    log.map((l, i) => (
                        <div key={i} className="flex gap-2 py-0.5">
                            <span className="text-zinc-700 shrink-0">
                                {new Date(l.ts).toLocaleTimeString("uk-UA")}
                            </span>
                            <span className={`${logColor[l.type]} break-all`}>{l.msg}</span>
                        </div>
                    ))
                )}
                <div ref={endRef} />
            </div>

            {connected && (
                <div className="flex gap-1.5 p-2 border-t border-zinc-800">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && send()}
                        placeholder='{"event":"ping"}'
                        className="flex-1 bg-zinc-800 rounded px-2 py-1.5 text-[15px] font-mono text-zinc-300 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-sky-600"
                    />
                    <button
                        onClick={send}
                        className="shrink-0 rounded px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[14px] font-bold transition-colors"
                    >
                        Send
                    </button>
                </div>
            )}
        </div>
    );
}
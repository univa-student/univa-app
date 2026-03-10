import { useState, useEffect, useCallback } from "react";
import { TrashIcon, PencilIcon } from "lucide-react";
import { SectionHeader } from "../ui/SectionHeader";

export function StorageTab() {
    const [entries, setEntries] = useState<[string, string][]>([]);
    const [editKey, setEditKey] = useState<string | null>(null);
    const [editVal, setEditVal] = useState("");
    const [filter, setFilter] = useState("univa");

    const load = useCallback(() => {
        try {
            setEntries(
                Object.entries(localStorage)
                    .filter(([k]) => !filter || k.includes(filter))
                    .sort(([a], [b]) => a.localeCompare(b)) as [string, string][]
            );
        } catch {
            setEntries([]);
        }
    }, [filter]);

    useEffect(() => {
        load();
    }, [load]);

    const del = (k: string) => {
        localStorage.removeItem(k);
        load();
    };

    const save = (k: string) => {
        localStorage.setItem(k, editVal);
        setEditKey(null);
        load();
    };

    const clearAll = () => {
        entries.forEach(([k]) => localStorage.removeItem(k));
        load();
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <SectionHeader
                title={`localStorage (${entries.length})`}
                action={
                    entries.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="text-[14px] text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                            <TrashIcon className="size-2.5" /> Clear filtered
                        </button>
                    )
                }
            />
            <div className="px-3 py-1.5 border-b border-zinc-800">
                <input
                    type="text"
                    placeholder='Filter by key prefix (e.g. "univa")'
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="w-full bg-zinc-800 rounded px-2 py-1 text-[15px] text-zinc-300 font-mono placeholder-zinc-600 outline-none focus:ring-1 focus:ring-zinc-600"
                />
            </div>
            <div className="overflow-y-auto flex-1">
                {entries.length === 0 ? (
                    <p className="px-3 py-4 text-[15px] text-zinc-600">No keys found.</p>
                ) : (
                    entries.map(([k, v]) => (
                        <div key={k} className="group border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                            <div className="flex items-center gap-2 px-3 py-1.5">
                                <span className="text-[15px] font-mono text-sky-400 flex-1 truncate">{k}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setEditKey(editKey === k ? null : k);
                                            setEditVal(v);
                                        }}
                                        className="rounded p-0.5 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300"
                                    >
                                        <PencilIcon className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => del(k)}
                                        className="rounded p-0.5 hover:bg-red-500/20 text-zinc-500 hover:text-red-400"
                                    >
                                        <TrashIcon className="size-3" />
                                    </button>
                                </div>
                            </div>
                            {editKey === k ? (
                                <div className="px-3 pb-2 flex gap-1.5">
                                    <input
                                        autoFocus
                                        value={editVal}
                                        onChange={e => setEditVal(e.target.value)}
                                        className="flex-1 bg-zinc-800 rounded px-2 py-1 text-[15px] text-zinc-300 font-mono outline-none focus:ring-1 focus:ring-sky-600"
                                    />
                                    <button
                                        onClick={() => save(k)}
                                        className="rounded px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white text-[14px] font-bold"
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <p className="px-3 pb-1.5 text-[14px] font-mono text-zinc-500 truncate">{v}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
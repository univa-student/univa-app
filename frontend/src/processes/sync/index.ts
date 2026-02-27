/**
 * Data sync layer for realtime events.
 *
 * Ідея з README: "realtime → оновлення кешу → UI".
 * Тут мають жити handlers, які оновлюють TanStack Query / локальний state
 * у відповідь на події від WebSocket.
 *
 * Поки що це лише заготовка під майбутню реалізацію.
 */

export function handleRealtimeEvent(event: unknown): void {
    // TODO: map RealtimeEvent -> cache updates
    // Наприклад:
    // - queryClient.invalidateQueries(["messages", spaceId])
    // - оптимістичні оновлення тощо
    void event;
}


export interface ScheduleEvent {
    startTime: string;
    endTime: string;
    title: string;
}

export function parseSchedule(text: string): ScheduleEvent[] {
    const events: ScheduleEvent[] = [];
    const lines = text.split('\n');
    
    let currentStartTime: string | null = null;
    let currentTitle: string = '';

    for (const line of lines) {
        const timeMatch = line.match(/^(\d{1,2}:\d{2}) - (.+)$/);
        if (timeMatch) {
            if (currentStartTime) {
                events.push({ startTime: currentStartTime, endTime: timeMatch[1], title: currentTitle });
            }
            currentStartTime = timeMatch[1];
            currentTitle = timeMatch[2].trim();
        } else if (currentStartTime) {
            currentTitle += '\n' + line.trim();
        }
    }
    if (currentStartTime) {
        events.push({ startTime: currentStartTime, endTime: '', title: currentTitle });
    }

    return events;
}

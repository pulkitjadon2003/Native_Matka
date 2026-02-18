export function isMarketOpen(openTime: string, closeTime: string, daysOpen: string[] = []): boolean {
    if (!openTime || !closeTime) return false;

    // Check if today is a valid day
    const now = new Date();
    // Adjust to IST if needed, but assuming server runs in correct timezone or UTC+5:30 offset handling
    // For now, use local server time which is set to IST in environment context

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = days[now.getDay()];

    if (daysOpen.length > 0 && !daysOpen.includes(currentDay)) {
        return false;
    }

    try {
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const parseTime = (timeStr: string) => {
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        const start = parseTime(openTime);
        const end = parseTime(closeTime);

        if (start < end) {
            // Normal day (e.g. 10 AM to 5 PM)
            return currentTime >= start && currentTime <= end;
        } else {
            // Overnight (e.g. 10 PM to 2 AM)
            return currentTime >= start || currentTime <= end;
        }
    } catch (e) {
        console.error("Error parsing market time", e);
        return false;
    }
}

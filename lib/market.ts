export function getISTDate() {
    const defaultDate = new Date();
    const istString = defaultDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    return new Date(istString);
}

export function getISTDateString(): string {
    const istDate = getISTDate();
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function isMarketOpen(startTime: string | undefined | null, closeTime: string, daysOpen: string[] = []): boolean {
    if (!closeTime) return false;

    // Use IST exclusively for all market evaluations
    const now = getISTDate();

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

        const start = startTime ? parseTime(startTime) : 0;
        const close = parseTime(closeTime);

        if (start < close) {
            // Normal day (e.g. 10 AM to 5 PM, or midnight to 5 PM)
            return currentTime >= start && currentTime <= close;
        } else {
            // Overnight (e.g. 10 PM to 2 AM)
            return currentTime >= start || currentTime <= close;
        }
    } catch (e) {
        console.error("Error parsing market time", e);
        return false;
    }
}

export function isTimePassed(timeStr: string): boolean {
    if (!timeStr) return false;
    try {
        const now = getISTDate();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const parseTime = (tStr: string) => {
            const [time, period] = tStr.trim().split(' ');
            let [hours, minutes] = (time || "").split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            return hours * 60 + (minutes || 0);
        };

        const targetMinutes = parseTime(timeStr);

        // Shift the day start to 5:00 AM (300 minutes) to handle overnight markets seamlessly
        // A "Matka Day" runs from 5:00 AM today to 4:59 AM tomorrow.
        const DAY_START = 300;
        const shiftTime = (t: number) => (t - DAY_START + 1440) % 1440;

        const shiftedCurrent = shiftTime(currentMinutes);
        const shiftedTarget = shiftTime(targetMinutes);

        return shiftedCurrent >= shiftedTarget;
    } catch (e) {
        return false;
    }
}

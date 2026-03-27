export const getDuration = (service: string) => {
    if (service === "haircut") return 40;
    if (service === "haircut_beard") return 60;
    return 0;
};

export const addMinutes = (time: string, minutes: number) => {
    const [h, m] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m + minutes, 0);

    return date.toTimeString().slice(0, 5); // HH:MM
    
};
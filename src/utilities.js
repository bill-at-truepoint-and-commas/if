// utilities.js - Pure utility functions

export function getCurrentWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + diff);
    
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[monday.getMonth()];
    const mondayDate = monday.getDate();
    const fridayDate = friday.getDate();
    
    return `${month}${mondayDate}-${fridayDate}`;
}

export function getDayOfWeek(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
}

export function getStorageKey(date) {
    const dayName = getDayOfWeek(date);
    const week = getCurrentWeek();
    return `dayplanner_${dayName}_weekof_${week}`;
}

export function getCurrentTimeSlot() {
    const now = new Date();
    const hour = now.getHours();
    
    const slots = ['09:00am', '10:00am', '11:00am', '12:00pm', 
                  '01:00pm', '02:00pm', '03:00pm', '04:00pm'];
    
    if (hour < 9) return slots[0];
    if (hour >= 16) return slots[slots.length - 1];
    
    const index = hour - 9;
    return slots[index];
}

export function getDaysOfWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        days.push(day);
    }
    
    return days;
}

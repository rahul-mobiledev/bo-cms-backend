const datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

const datesAreOnSameMonth = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth();


const getDaysInMonth = (month, year) => {
    var date = new Date(year, month, 1);
    var days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

const getMonthInYear = (year) => {
    var date = new Date(year, 0);
    var months = [];
    while (date.getFullYear() === year) {
        months.push(new Date(date));
        date.setMonth(date.getMonth() + 1);
    }
    return months;
}

module.exports = {
    datesAreOnSameDay: datesAreOnSameDay,
    datesAreOnSameMonth: datesAreOnSameMonth,
    getDaysInMonth : getDaysInMonth,
    getMonthInYear : getMonthInYear
}


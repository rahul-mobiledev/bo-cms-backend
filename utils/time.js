const datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

const datesAreOnSameMonth = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth();

module.exports = {
    datesAreOnSameDay: datesAreOnSameDay,
    datesAreOnSameMonth : datesAreOnSameMonth
}


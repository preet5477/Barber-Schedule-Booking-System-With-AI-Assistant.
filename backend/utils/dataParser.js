const parseAppointmentDate = (input) => {

  const today = new Date();

  const lower = input.toLowerCase();

  // TODAY
  if (lower.includes('today')) {

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

  }

  // TOMORROW
  if (lower.includes('tomorrow')) {

    const tomorrow = new Date();

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );

    return new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    );

  }

  // DEFAULT
  return today;
};

module.exports = parseAppointmentDate;
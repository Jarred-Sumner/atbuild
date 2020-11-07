const secondsAgo = (date) => {
  let formattedDate = "";
  var hours = date.getUTCHours() % 12;
  hours = hours || 12;
  formattedDate += hours.toString(10);
  formattedDate += ":";
  formattedDate += date.getUTCMinutes().toString(10);
  formattedDate += ":";
  formattedDate += date.getUTCSeconds().toString(10);
  return formattedDate;
};
export {
  secondsAgo
};

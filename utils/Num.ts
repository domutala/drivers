function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

function formatDuration(duration: number) {
  const hours = Math.floor(duration / 3600);
  const remainingSeconds = duration % 3600;
  const minutes = Math.floor(remainingSeconds / 60);

  if (hours < 1) {
    if (minutes < 1) return "moins d'une minute";
    return `${minutes} min`;
  }
  return `${hours} h ${minutes} min`;
}

function formatDistance(distance: number) {
  let distanceFormatee: string;

  if (distance >= 1000) {
    var distanceEnKilometres = distance / 1000;
    distanceFormatee = distanceEnKilometres.toFixed(2) + " km";
  } else {
    distanceFormatee = distance.toFixed(0) + " m";
  }

  return distanceFormatee;
}

export default { formatTime, formatDuration, formatDistance };

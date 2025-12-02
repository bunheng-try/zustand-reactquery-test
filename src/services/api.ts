export const getRandomDog = async () => {
  const res = await fetch("https://dog.ceo/api/breeds/image/random");
  return res.json();
};
// here is react-query that fetch data from internet
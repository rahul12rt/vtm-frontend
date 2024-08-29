export const getUniqueOptions = (data, key) => {
  const options = data
    .map((item) => {
      const value = item.attributes[key]?.data?.attributes?.name || "";
      return { id: value, name: value };
    })
    .filter((option) => option.name);

  const uniqueOptions = [...new Set(options.map((option) => option.name))].map(
    (name) => options.find((option) => option.name === name)
  );

  return uniqueOptions;
};

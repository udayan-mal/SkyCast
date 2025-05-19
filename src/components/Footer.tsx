
export const Footer = () => {
  return (
    <footer className="mt-12 text-center text-sm text-muted-foreground">
      <p>SkyView Weather App © {new Date().getFullYear()}</p>
      <p className="mt-1">Powered by OpenWeatherMap</p>
    </footer>
  );
};

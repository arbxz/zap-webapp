const linkClass =
  "text-arbxz-accent-text underline underline-offset-4 hover:no-underline";

const Footer = () => {
  return (
    <footer className="mt-8 flex flex-col items-center gap-2 border-t border-window-border py-8 font-mono text-xs text-window-muted">
      <p>
        Made by{" "}
        <a
          href="https://arbxz.dev"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          arbxz.dev
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>

      <p>
        Thanks to{" "}
        <a
          href="https://github.com/MrSunshyne"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Sandeep Ramgolam
          <span className="sr-only"> (opens in a new tab)</span>
        </a>{" "}
        for the API.
      </p>
    </footer>
  );
};

export default Footer;

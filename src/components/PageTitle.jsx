export default function PageTitle({ children }) {
  return (
    <h1 className="page-title">
      <span className="page-title-bar" aria-hidden="true" />
      <span className="page-title-text">{children}</span>
      <span className="page-title-bar" aria-hidden="true" />
    </h1>
  );
}

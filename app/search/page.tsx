export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <>
      <h1>Search results for {q}</h1>
    </>
  );
}

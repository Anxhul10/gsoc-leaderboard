import data from "@/data/2026.json";
import Org from "@/components/Org";

export const dynamic = "force-dynamic";

const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  const filteredData = data.filter((org) => {
    const search = normalize(q);

    return (
      normalize(org.name).includes(search) ||
      normalize(org.tagline).includes(search) ||
      org.tech_tags.some((tag) => normalize(tag).includes(search)) ||
      org.topic_tags.some((tag) => normalize(tag).includes(search))
    );
  });

  return (
    <>
      <h2>
        <i>Search results for `{q}`</i>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          padding: "20px",
        }}
      >
        {filteredData.map((org) => (
          <Org
            key={org.slug}
            slug={org.slug}
            name={org.name}
            image={org.logo_url}
            description={org.description}
          />
        ))}
      </div>
    </>
  );
}

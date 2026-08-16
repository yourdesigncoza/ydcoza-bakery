import { CakeBuilder } from "@/components/builder/CakeBuilder";
import { SiteHeader } from "@/components/SiteHeader";
import { BRAND } from "@/lib/brand";
import { decodeConfig } from "@/lib/config-codec";

export default async function BuilderPage({
  searchParams,
}: PageProps<"/">) {
  // A shared design link drops the customer straight back into their cake.
  const params = await searchParams;
  const design = Array.isArray(params.d) ? params.d[0] : params.d;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1560px] flex-1 flex-col px-4 pb-10">
        <div className="py-6 text-center">
          <h1 className="font-display text-[40px] font-semibold leading-none text-ink sm:text-[46px]">
            Build Your Cake
          </h1>
          <p className="mt-2.5 text-[13px] text-body">{BRAND.tagline}</p>
        </div>

        <CakeBuilder initialConfig={decodeConfig(design)} />
      </main>
    </>
  );
}

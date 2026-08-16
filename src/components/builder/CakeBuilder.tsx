"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ADD_ONS,
  CAKE_TYPES,
  FILLINGS,
  FINISHES,
  FLAVOURS,
  OCCASIONS,
  PALETTES,
  PRESENTATIONS,
  resolve,
  sizesFor,
} from "@/lib/catalogue";
import type { CakeConfig } from "@/lib/catalogue/types";
import { priceCake } from "@/lib/catalogue/pricing";
import { encodeConfig } from "@/lib/config-codec";
import { BowlIcon, CakeIcon, EyeIcon, GiftIcon, OCCASION_ICONS, PaletteIcon } from "@/components/icons";
import { BuilderColumn, OptionGroup } from "./BuilderColumn";
import { OptionTile } from "./OptionTile";
import { PreviewPanel } from "./PreviewPanel";

/**
 * The five-step cake builder.
 *
 * All five columns read and write one `CakeConfig`, and every price, summary
 * line and preview prompt is derived from it rather than tracked separately.
 */
export function CakeBuilder({ initialConfig }: { initialConfig: CakeConfig }) {
  const [config, setConfig] = useState<CakeConfig>(initialConfig);

  const sizes = useMemo(() => sizesFor(config.typeId), [config.typeId]);
  const quote = useMemo(() => priceCake(config), [config]);

  const update = useCallback(
    <K extends keyof CakeConfig>(key: K, value: CakeConfig[K]) =>
      setConfig((current) => ({ ...current, [key]: value })),
    [],
  );

  /** Changing the cake type can retire the chosen size, so re-pick if needed. */
  const chooseType = useCallback((typeId: string) => {
    setConfig((current) => {
      const available = sizesFor(typeId);
      const stillOffered = available.some((size) => size.id === current.sizeId);
      return {
        ...current,
        typeId,
        sizeId: stillOffered ? current.sizeId : available[0].id,
      };
    });
  }, []);

  const toggleAddOn = useCallback((id: string) => {
    setConfig((current) => ({
      ...current,
      addOnIds: current.addOnIds.includes(id)
        ? current.addOnIds.filter((addOn) => addOn !== id)
        : [...current.addOnIds, id],
    }));
  }, []);

  /** Wording only matters when something on the cake carries it. */
  const wordingCarriers = ["acrylic-topper", "name-plaque", "custom-message"];
  const needsInscription = config.addOnIds.some((id) => wordingCarriers.includes(id));

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.05fr_0.95fr_1.15fr_0.95fr_1.15fr]">
      <BuilderColumn step={1} title="Select Cake Type" icon={<CakeIcon className="h-5 w-5" />}>
        <OptionGroup>
          {CAKE_TYPES.map((type) => (
            <OptionTile
              key={type.id}
              name={type.name}
              tagline={type.tagline}
              image={type.image}
              selected={config.typeId === type.id}
              onSelect={() => chooseType(type.id)}
            />
          ))}
        </OptionGroup>
      </BuilderColumn>

      <BuilderColumn step={2} title="Flavours & Fillings" icon={<BowlIcon className="h-5 w-5" />}>
        <OptionGroup label="Choose Flavour">
          {FLAVOURS.map((flavour) => (
            <OptionTile
              key={flavour.id}
              name={flavour.name}
              tagline={flavour.tagline}
              image={flavour.image}
              surcharge={flavour.surcharge}
              selected={config.flavourId === flavour.id}
              onSelect={() => update("flavourId", flavour.id)}
            />
          ))}
        </OptionGroup>

        <OptionGroup label="Choose Filling">
          {FILLINGS.map((filling) => (
            <OptionTile
              key={filling.id}
              name={filling.name}
              tagline={filling.tagline}
              image={filling.image}
              surcharge={filling.surcharge}
              selected={config.fillingId === filling.id}
              onSelect={() => update("fillingId", filling.id)}
            />
          ))}
        </OptionGroup>

        <OptionGroup label="Your Selections" className="space-y-1.5">
          {[resolve("flavourId", config.flavourId), resolve("fillingId", config.fillingId)].map(
            (option) => (
              <p
                key={option.id}
                className="rounded-lg bg-accent-soft px-3 py-2 text-[13px] font-medium text-ink"
              >
                {option.name}
              </p>
            ),
          )}
        </OptionGroup>
      </BuilderColumn>

      <BuilderColumn
        step={3}
        title="Customize Your Cake"
        icon={<PaletteIcon className="h-5 w-5" />}
      >
        <OptionGroup label="Colour Palette" className="flex flex-wrap gap-2.5">
          {PALETTES.map((palette) => {
            const selected = config.paletteId === palette.id;
            return (
              <button
                key={palette.id}
                type="button"
                title={palette.name}
                aria-label={palette.name}
                aria-pressed={selected}
                onClick={() => update("paletteId", palette.id)}
                className={`h-9 w-9 rounded-full border-2 transition ${
                  selected
                    ? "border-accent ring-2 ring-accent/25 ring-offset-2 ring-offset-card"
                    : "border-rule-strong hover:border-muted"
                }`}
                style={{ backgroundColor: palette.hex }}
              />
            );
          })}
        </OptionGroup>

        <OptionGroup label="Cake Size / Servings" className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <OptionTile
              key={size.id}
              name={size.name}
              tagline={size.servings}
              layout="compact"
              selected={config.sizeId === size.id}
              onSelect={() => update("sizeId", size.id)}
            />
          ))}
        </OptionGroup>

        <OptionGroup label="Finish Style" className="grid grid-cols-2 gap-2">
          {FINISHES.map((finish) => (
            <OptionTile
              key={finish.id}
              name={finish.name}
              tagline={finish.tagline}
              image={finish.image}
              surcharge={finish.surcharge}
              layout="grid"
              selected={config.finishId === finish.id}
              onSelect={() => update("finishId", finish.id)}
            />
          ))}
        </OptionGroup>

        <OptionGroup label="Occasion" className="grid grid-cols-4 gap-2">
          {OCCASIONS.map((occasion) => {
            const Icon = OCCASION_ICONS[occasion.id];
            return (
              <OptionTile
                key={occasion.id}
                name={occasion.name}
                layout="compact"
                ornament={<Icon className="h-6 w-6 text-accent" />}
                selected={config.occasionId === occasion.id}
                onSelect={() => update("occasionId", occasion.id)}
              />
            );
          })}
        </OptionGroup>

        <OptionGroup label="Presentation Style">
          {PRESENTATIONS.map((presentation) => (
            <OptionTile
              key={presentation.id}
              name={presentation.name}
              tagline={presentation.tagline}
              image={presentation.image}
              surcharge={presentation.surcharge}
              selected={config.presentationId === presentation.id}
              onSelect={() => update("presentationId", presentation.id)}
            />
          ))}
        </OptionGroup>
      </BuilderColumn>

      <BuilderColumn step={4} title="Add-ons" icon={<GiftIcon className="h-5 w-5" />}>
        <OptionGroup>
          {ADD_ONS.map((addOn) => (
            <OptionTile
              key={addOn.id}
              name={addOn.name}
              tagline={addOn.tagline}
              image={addOn.image}
              surcharge={addOn.surcharge}
              toggle
              selected={config.addOnIds.includes(addOn.id)}
              onSelect={() => toggleAddOn(addOn.id)}
            />
          ))}
        </OptionGroup>

        <OptionGroup label={needsInscription ? "Wording On The Cake" : "Wording"}>
          <input
            type="text"
            value={config.inscription}
            maxLength={40}
            disabled={!needsInscription}
            onChange={(event) => update("inscription", event.target.value)}
            placeholder={
              needsInscription ? "e.g. Happy 21st Thando" : "Add a topper, plaque or message first"
            }
            className="w-full rounded-lg border border-rule bg-card px-3 py-2.5 text-[13px] text-ink placeholder:text-muted focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-page disabled:placeholder:text-muted/70"
          />
          <p className="mt-1.5 text-[11px] text-muted">
            {needsInscription
              ? `${config.inscription.length}/40 characters — spelled exactly as you'd like it piped.`
              : "Choose an Acrylic Topper, Name Plaque or Custom Message to add wording."}
          </p>
        </OptionGroup>
      </BuilderColumn>

      <BuilderColumn step={5} title="Preview & Actions" icon={<EyeIcon className="h-5 w-5" />}>
        <PreviewPanel
          config={config}
          quote={quote}
          onInstructionsChange={(value) => update("specialInstructions", value)}
        />
        <Link
          href={`/checkout?d=${encodeConfig(config)}`}
          className="block w-full rounded-xl bg-cocoa px-4 py-3.5 text-center text-[14px] font-semibold text-white transition hover:bg-ink"
        >
          {quote.requiresQuote ? "Request a quote" : "Continue to checkout"}
        </Link>
      </BuilderColumn>
    </div>
  );
}

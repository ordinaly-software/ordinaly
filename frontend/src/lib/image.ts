import createImageUrlBuilder from '@sanity/image-url'
import {client} from './sanity'

// Accept either a direct reference/url object or the common { asset: { ... } } wrapper
export type SanityImageSource =
	| string
	| { _ref?: string; _id?: string; url?: string }
	| { asset?: { _ref?: string; _id?: string; url?: string } };

function resolveImageSource(src: unknown): string | { _ref?: string } | null {
	if (!src) return null;
	if (typeof src === 'string') return src;
	// object shapes
	const s = src as Record<string, unknown>;
	const asset = s['asset'];
	if (asset) {
		if (typeof asset === 'string') return asset;
		const a = asset as Record<string, unknown>;
		const ref = a['_ref'];
		const url = a['url'];
		if (typeof ref === 'string') return { _ref: ref };
		if (typeof url === 'string') return url;
	}
	const sref = s['_ref'];
	const surl = s['url'];
	if (typeof sref === 'string') return { _ref: sref };
	if (typeof surl === 'string') return surl;
	return null;
}

type ImageBuilder = {
	width: (n: number) => ImageBuilder;
	height: (n: number) => ImageBuilder;
	fit: (s: string) => ImageBuilder;
	url: () => string;
};

function createNoopBuilder(): ImageBuilder {
	const builder: Partial<ImageBuilder> = {};
	builder.width = () => builder as ImageBuilder;
	builder.height = () => builder as ImageBuilder;
	builder.fit = () => builder as ImageBuilder;
	builder.url = () => '';
	return builder as ImageBuilder;
}

export const urlFor = (src: SanityImageSource | unknown) => {
	const resolved = resolveImageSource(src);
	if (!resolved) return createNoopBuilder();
	return createImageUrlBuilder(client).image(resolved as SanityImageSource);
};

import createImageUrlBuilder from '@sanity/image-url'
import {client} from './sanity'
export const urlFor = (src:any) => createImageUrlBuilder(client).image(src)

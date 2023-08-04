export const getImageUrl = url => {
    const name = url.replace('@/assets/icons', '')
    return new URL(`../src/assets/icons/${name}`, import.meta.url).href
}
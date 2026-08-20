import galaxy from '../assets/moeqyGirl/moeqyGirl_MqyGalaxy_noBackground.webp';
import cat from '../assets/moeqyGirl/moeqyGirlCat_noBackground.webp';
import good from '../assets/moeqyGirl/moeqyGirlGood_noBackground.webp';
import thinking from '../assets/moeqyGirl/moeqyGirlthinking_noBackground.webp';
import rsiGalaxy from '../assets/collections/rsi-galaxy/galaxy-product.webp';
import mascotKey from '../images/moegn-mascot-key.png';
import standee from '../images/moegn-hero-standee-transparent.png';

export const collectionAssets: Record<string, ImageMetadata> = {
	galaxy,
	cat,
	good,
	thinking,
	'rsi-galaxy': rsiGalaxy,
	'mascot-key': mascotKey,
	standee,
};

export const getCollectionAsset = (imageKey: string) => collectionAssets[imageKey] ?? standee;

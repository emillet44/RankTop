import { LoadAll, LoadVerified, LoadUnverified } from "../serverActions/loadposts";

//This function will update the Algolia search indices with verified, unverified, and all posts. Currently it is not called anywhere on the site, and is called
//manually when necessary to update the posts(A better implementation would be to put it on a timer or update after a certain amount of posts). 
export async function AlgoliaUpdate() {
    const algoliasearch = require('algoliasearch')
    const client = algoliasearch('PL301U4XAW', process.env.ALGOLIA_API_KEY)
    const vindex = client.initIndex('posts_verified');
    const uindex = client.initIndex('posts_unverified');
    const index = client.initIndex('posts');
    
    const vposts = await LoadVerified();
    const uposts = await LoadUnverified();
    const posts = await LoadAll();
    
    vindex.replaceAllObjects(vposts, {
        autoGenerateObjectIDIfNotExist: true
    });
    uindex.replaceAllObjects(uposts, {
        autoGenerateObjectIDIfNotExist: true
    });
    index.replaceAllObjects(posts, {
        autoGenerateObjectIDIfNotExist: true
    });
}

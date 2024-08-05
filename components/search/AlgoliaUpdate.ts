import { LoadAll } from "../serverActions/loadposts";

//This function will update the Algolia search indices with all posts. Currently it is not called anywhere on the site, and is called
//manually when necessary to update the posts(A better implementation would be to put it on a timer or update after a certain amount of posts).
export async function AlgoliaUpdate() {
    const algoliasearch = require('algoliasearch')
    const client = algoliasearch('PL301U4XAW', process.env.ALGOLIA_API_KEY)

    const index = client.initIndex('posts');
    const posts = await LoadAll();
    
    index.replaceAllObjects(posts, {
        autoGenerateObjectIDIfNotExist: true
    });

    console.log("Search updated");
}

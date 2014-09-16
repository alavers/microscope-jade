if (Posts.find().count === 0) {
    Posts.insert({
        title: 'Introducing Telescope',
        author: 'Sacha Greif',
        url: 'http://sachagreif.com/introducing-telescope/'
    });

    Posts.insert({
        title: 'Monkeys Eating Pickles',
        author: 'Andrew Lavers',
        url: 'http://vumpler.com'
    });
}
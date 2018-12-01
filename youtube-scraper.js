const rp = require('request-promise');
const cheerio = require('cheerio');
const getParams = (url) => {
    var url = url.substring(1);
    return JSON.parse('{"' + decodeURI(url).replace('watch?','').replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
}  

exports.scrapePlaylist = async function(id){
    var html =  await rp(`https://www.youtube.com/playlist?list=${id}`)
    
    
    var $ = cheerio.load(html);

    var moviesContainer = $('.pl-video-table');
    var moviesElements = $(moviesContainer).find('tr');
    var movies = [];
    moviesElements.each((i, item) => {
        var el = $(item);
        var titleLink = el.find('.pl-video-title-link');
        var authorLink = el.find('.pl-video-owner > a');
        var timestamp = el.find('.more-menu-wrapper .timestamp span');

        let params = getParams(titleLink.attr('href'));
        var movie = {
            name: titleLink.text().trim(),
            url: {
                full: titleLink.attr('href'),
                ...params
            },
            id: params.v,
            timestamp: timestamp.text(),
            time: timestamp.attr('aria-label'),
            thumbnail: `https://img.youtube.com/vi/${params.v}/0.jpg`,
            author: {
                name: authorLink.text(),
                url: authorLink.attr('href')
            }

        }
        movies.push(movie);
    })
    return movies;
}
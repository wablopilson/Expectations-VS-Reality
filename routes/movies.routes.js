const router = require("express").Router()

const Message = require('./../models/Message.model')
const Post = require('./../models/Post.model')
const Short = require('./../models/Short.model')
const User = require('./../models/User.model')

const APIHandler = require('./../public/js/APIHandler')
const imdb = new APIHandler()

const { isLoggedOut, isLoggedIn } = require('./../middleware/route-guard')

router.post('/search', (req, res) => {

    imdb
        .getDetails(req.body.title)
        .then(({ data }) => { res.render('movies/search-list', { movies: data.results }) })
        .catch(err => console.log(err))
})

router.get('/details/:movieId', (req, res) => {



    const { movieId } = req.params

    const promises = [
        imdb.getTrailer(movieId),
        Post.find({ movieOrShortId: movieId, type: 'COMMENT' }),
        Post.find({ movieOrShortId: movieId, type: 'SPOILER' })
    ]

    Promise
        .all(promises)
        .then(([movieInfo, comments, spoilers]) => {
            const viewData = { movieInfo: movieInfo.data, comments, spoilers }
            res.render('movies/movie-details', viewData)
        })
        .catch(err => console.log(err))




})

router.post('/:movieId/save', (req, res) => {

    // console.log(req.session.currentUser)
    // console.log(req.params)
    const { movieId } = req.params
    // console.log(movieId)

    console.log(movieId + 'HOLAAAAAAAAA' + req.session.currentUser.savedMovies)



    if (req.session.currentUser.savedMovies.includes(movieId, 0)) {
        res.redirect(`/`)
    } else {
        User
            .findById(req.session.currentUser._id)
            .update({ $push: { savedMovies: movieId } })
            .then(() => res.redirect(`/movies/details/${movieId}`))
            .catch(err => console.log(err))
    }



})

router.post('/:movieId/unsave', (req, res) => {


    User
        .findById(req.session.currentUser.id)
        .then(user => {
            if (user.savedMovies.includes(req.params.movieId)) {
                user.savedMovies.splice(user.savedMovies.indexOf(req.params.movieId), 1)
            }
        }
        )
        .catch(err => console.log(err))


})





module.exports = router
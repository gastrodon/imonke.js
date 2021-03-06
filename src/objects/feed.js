const MonkeThing = require("./monkething")
const Content = require("./content")

class Feed extends MonkeThing {
    constructor(opts = {}) {
        super(opts)

        this.feed = opts.feed || opts.id
        if (!this.feed) {
            throw "A feed name is required"
        }

        this.paginated_size = opts.paginated_size || 25
        this.route = `/feed/${this.feed}`
        this.key = "content"
    }

    async get(opts = {}) {
        let response = await this.request({
            method: "GET",
            url: this.api + this.route,
            params: {
                size: opts.size || this.paginated_size,
                before: opts.before || null,
            },
        })

        return response[this.key].map(
            it => new Content({id: it.id, data: it})
        )
    }

    get content() {
        return (async function* (instance) {
            let before = ""
            let buffer = []

            do {
                yield* buffer

                buffer = await instance.get({
                    size: instance.paginated_size,
                    before: buffer.length ? await buffer[buffer.length-1].id : "",
                })
            } while (buffer.length)
        })(this)
    }
}

module.exports = Feed

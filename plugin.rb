# name: Discourse Adsense
# about: Adds Adsense to Discourse
# version: 0.16
# author: DiscourseHosting.com
# minimum Discourse version: v0.9.9.16

register_asset "javascripts/adsense.js"
register_asset "javascripts/discourse/templates/discovery.js.handlebars"
register_asset "javascripts/discourse/templates/topic.js.handlebars"

register_css <<CSS

.adsense {
  text-align: center;
  padding: 3px;
  margin-bottom: 10px;
}

CSS

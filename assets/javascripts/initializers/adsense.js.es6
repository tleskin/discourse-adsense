import PostModel from 'discourse/models/post';
import { withPluginApi } from 'discourse/lib/plugin-api';
import PageTracker from 'discourse/lib/page-tracker';

function __push() {
  const i = $('.adsense').size();
  const j = $('.adsense .adsbygoogle ins ins').size();

  $('ins.adsbygoogle').each(function(){
    if ($(this).html() === '') {
      window.adsbygoogle.push({});
    }
  });
  if(i>j) {
    window.setTimeout(__push, 300);
  }
}

function __reload_gads () {
  const ads = document.getElementById("adsense_loader");
  if (ads) {
    // clear the old element and its state
    //ads.remove();
    ads.parentNode.removeChild(ads);
    for (var key in window) {
      if (key.indexOf("google") !== -1){
        window[key] = undefined;
      }
    }
  }
  window.adsbygoogle = [];
  const ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true; ga.id="adsense_loader";
  ga.src = '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  const s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  window.setTimeout(__push, 200);
}

function oldPluginCode() {
  PageTracker.current().on('change', __reload_gads);
}

function initializeAdsense(api) {
  api.onPageChange(__reload_gads);
}

export default {
  name: "apply-adsense",
  initialize(container) {
    
    const currentUser = container.lookup('current-user:main');
    const siteSettings = container.lookup('site-settings:main');
    const publisherCode = (siteSettings.adsense_publisher_code || '').trim();

    PostModel.reopen({
      postSpecificCount: function() {
        return this.isNthPost(parseInt(siteSettings.adsense_nth_post_code));
      }.property('post_number'),

      isNthPost: function(n) {
        if (n && n > 0) {
          return (this.get('post_number') % n) === 0;
        } else {
          return false;
        }
      }
    });
    
    withPluginApi('0.1', api => {
      api.decorateWidget('post:after', dec => {
        return dec.connect({
          templateName: 'connectors/post-bottom/adsense',
          context: 'model'
        });
      });
    });

    Ember.Handlebars.helper('adsenseBlock', (width, height, slotid) => {
      if (currentUser) {
        if (currentUser.get('trust_level') > siteSettings.adsense_through_trust_level) {
          return "";
        }

        //Get badges
        //console.log(currentUser.get('badges')); // uncomment for debugging
        var badges = currentUser.get('badges');
        //Get plugin badge name
        //console.log(siteSettings.adsense_through_badge); // uncomment for debugging
        //List badges and compare them to the one saved in the plugin settings
        var no_ads_badges = siteSettings.adsense_through_badge.split("|");
        //console.log(no_ads_badges);
        for (var badge of badges){
          for (var no_ad_badge of no_ads_badges){
            if (badge.name.toLowerCase() == no_ad_badge.toLowerCase()) {
              //console.log('Do NOT show the Ads for ' + badge.name.toLowerCase()); // uncomment for debugging
              return "";  //Uncomment to disable ad's
            } else {
              //console.log('Show the Ads for ' + badge.name.toLowerCase() );  // uncomment for debugging
            }
          }
        }
      }

      const position = slotid.replace('_mobile', '');
      if (siteSettings['adsense_show_' + position]) {
        return new Handlebars.SafeString('<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>' +
          '<div class="adsense adsense_' + slotid.trim() + '">' +
          '<ins class="adsbygoogle" style="display:inline-block;width:' +
          width + 'px;height:'+ height + 'px" data-ad-client="' + publisherCode +
          '" data-ad-slot="' + siteSettings['adsense_ad_slot_' + slotid.trim()] + '"></ins>' +
          '</div>' +
          '<script> (adsbygoogle = window.adsbygoogle || []).push({}); </script>'
        );
      }

      return "";
    });

    if (publisherCode.length) {
      withPluginApi('0.1', initializeAdsense, { noApi: oldPluginCode });
    }
  }
};

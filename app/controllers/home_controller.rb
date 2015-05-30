class HomeController < ApplicationController
  def index
    @matches = Match.all.order('created_at DESC')
  end

  def test
    p = EbotSiteParser.new
    p.check_all_sites
    render :text => 'LOL'
  end
end

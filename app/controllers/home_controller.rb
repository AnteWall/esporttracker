class HomeController < ApplicationController
  def index
    @matches = Match.all.order('created_at DESC')
  end

  def test
    CsgoMatchWorker.perform_async
    render :text => 'LOLa'
  end
end

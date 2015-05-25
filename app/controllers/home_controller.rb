class HomeController < ApplicationController
  def index
    @matches = Match.all.order('created_at DESC')
  end
end

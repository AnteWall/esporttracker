class MatchController < ApplicationController
  def show
    @match = match
  end    

  def start_tracking
    tracker = Csgotracker.new Match.find(params[:match_id])
    tracker.start_tracking
    redirect_to root_path 
  end

  def log
    last_id = params[:last_event].to_i ||= 0
    match = MatchEvent.where(:match_id => params[:match_id]).where(id: last_id..Float::INFINITY)
    render json: match
  end

  private

  def match
    Match.find(params[:id])
  end
end

class MatchController < ApplicationController
  def show
    @match = match
  end    

  def start_tracking
    CsgoWorker.perform_async(params[:match_id])
    redirect_to match_path(params[:match_id]) 
  end

  def log
    last_id = params[:last_event].to_i ||= 0
    match = MatchEvent.where(:match_id => params[:match_id]).where(id: last_id..Float::INFINITY)
    render json: match
  end

  def live
    render json: Match.live
  end

  private
  def match
    Match.find(params[:id])
  end
end

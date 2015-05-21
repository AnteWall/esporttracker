class CsgoWorker
  include Sidekiq::Worker
  sidekiq_options queue: "high"
  
  def perform
    tracker = Csgotracker.new Match.find(params[:match_id])
    tracker.start_tracking
  end

end

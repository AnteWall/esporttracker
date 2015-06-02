class CsgoWorker
  include Sidekiq::Worker
  def perform(match_id)
    tracker = Csgotracker.new Match.find(match_id)
    tracker.start_tracking
  end
end

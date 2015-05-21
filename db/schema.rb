# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150521144330) do

  create_table "delayed_jobs", force: :cascade do |t|
    t.integer  "priority",   default: 0, null: false
    t.integer  "attempts",   default: 0, null: false
    t.text     "handler",                null: false
    t.text     "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string   "locked_by"
    t.string   "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "delayed_jobs", ["priority", "run_at"], name: "delayed_jobs_priority"

  create_table "match_events", force: :cascade do |t|
    t.string   "log"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "match_id"
    t.datetime "log_time"
  end

  create_table "matches", force: :cascade do |t|
    t.string   "log_path"
    t.datetime "start_time"
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.integer  "team_1_score", default: 0
    t.integer  "team_2_score", default: 0
    t.string   "team_1"
    t.string   "team_2"
    t.string   "status"
  end

  create_table "round_win_events", force: :cascade do |t|
    t.boolean  "ct_win"
    t.boolean  "t_win"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end

import React from 'react';
import { Card, CardContent } from "../components/ui/card";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { useTranslation } from "../hooks/useTranslation";
import { Link } from "wouter";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Card className="w-full max-w-md mx-4 bg-gradient-to-br from-hermes-card via-gray-900 to-hermes-card border border-hermes-border shadow-2xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#62cbc1] to-[#4db8a8] rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-black" />
            </div>
            
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '700' }}>
              404
            </h1>
            
            <h2 className="text-xl font-semibold text-[#62cbc1] mb-2" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600' }}>
              {t('notFound.title') || 'Page Not Found'}
            </h2>

            <p className="text-gray-400 text-sm mb-6" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              {t('notFound.description') || 'The page you are looking for does not exist.'}
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => window.history.back()}
                variant="outline" 
                className="border-hermes-border text-[#62cbc1] hover:bg-[#62cbc1] hover:text-black"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('notFound.goBack') || 'Go Back'}
              </Button>
              
              <Link href="/">
                <Button className="bg-gradient-to-r from-[#62cbc1] via-[#4db8a8] to-[#62cbc1] hover:from-[#4db8a8] hover:to-[#5cb4a3] text-black font-semibold">
                  <Home className="w-4 h-4 mr-2" />
                  {t('notFound.home') || 'Home'}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
